using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace CineSuite.Server.Hubs;

/// <summary>
/// Hub SignalR flexible pour architecture Controller/Screen
/// Permet à n'importe quel appareil de contrôler n'importe quel autre
/// </summary>
public class CinemaHub : Hub
{
    private readonly ILogger<CinemaHub> _logger;
    
    // Stockage en mémoire des clients connectés et leurs rôles
    private static readonly ConcurrentDictionary<string, ClientInfo> _clients = new();
    
    public CinemaHub(ILogger<CinemaHub> logger)
    {
        _logger = logger;
    }
    
    /// <summary>
    /// Classe pour stocker les infos d'un client
    /// </summary>
    public class ClientInfo
    {
        public string ConnectionId { get; set; } = "";
        public string Role { get; set; } = ""; // "controller" | "screen" | "standalone"
        public string? RoomId { get; set; } // SceneID pour la synchronisation
        public string DeviceType { get; set; } = ""; // "mobile" | "desktop"
        public DateTime ConnectedAt { get; set; }
    }

    // ==================== GESTION DES RÔLES ET ROOMS ====================
    
    /// <summary>
    /// Un client s'enregistre avec son rôle et rejoint une room
    /// </summary>
    public async Task RegisterClient(string role, string? roomId, string deviceType)
    {
        var connectionId = Context.ConnectionId;
        
        var clientInfo = new ClientInfo
        {
            ConnectionId = connectionId,
            Role = role,
            RoomId = roomId,
            DeviceType = deviceType,
            ConnectedAt = DateTime.UtcNow
        };
        
        // Retirer du groupe précédent si ré-enregistrement
        if (_clients.TryGetValue(connectionId, out var oldClient) && !string.IsNullOrEmpty(oldClient.RoomId))
        {
            await Groups.RemoveFromGroupAsync(connectionId, oldClient.RoomId);
            _logger.LogInformation("🚪 Client {ConnectionId} left old room {RoomId}", connectionId, oldClient.RoomId);
        }
        
        _clients[connectionId] = clientInfo;
        _logger.LogInformation("🎭 Client registered: {ConnectionId} as {Role} in room {RoomId} ({DeviceType})", 
            connectionId, role, roomId ?? "none", deviceType);
        
        // Rejoindre le groupe SignalR de la room
        if (!string.IsNullOrEmpty(roomId))
        {
            await Groups.AddToGroupAsync(connectionId, roomId);
            _logger.LogInformation("🚪 Client {ConnectionId} joined room {RoomId}", connectionId, roomId);
            
            // Notifier les autres membres de la room
            await Clients.Group(roomId).SendAsync("ClientJoinedRoom", new
            {
                connectionId,
                role,
                deviceType,
                timestamp = DateTime.UtcNow
            });
        }
        
        // Envoyer la liste des clients de la room à tout le monde
        await BroadcastRoomClients(roomId);
    }
    
    /// <summary>
    /// Obtenir la liste des clients connectés à une room
    /// </summary>
    public async Task GetRoomClients(string roomId)
    {
        var roomClients = _clients.Values
            .Where(c => c.RoomId == roomId)
            .Select(c => new
            {
                c.ConnectionId,
                c.Role,
                c.DeviceType,
                c.ConnectedAt
            })
            .ToList();
        
        await Clients.Caller.SendAsync("RoomClientsUpdated", roomClients);
    }
    
    /// <summary>
    /// Broadcaster la liste des clients d'une room
    /// </summary>
    private async Task BroadcastRoomClients(string? roomId)
    {
        if (string.IsNullOrEmpty(roomId)) return;
        
        var roomClients = _clients.Values
            .Where(c => c.RoomId == roomId)
            .Select(c => new
            {
                c.ConnectionId,
                c.Role,
                c.DeviceType,
                c.ConnectedAt
            })
            .ToList();
        
        await Clients.Group(roomId).SendAsync("RoomClientsUpdated", roomClients);
    }

    // ==================== COMMUNICATION BIDIRECTIONNELLE ====================
    
    /// <summary>
    /// Un contrôleur envoie une action vers les écrans d'une room
    /// </summary>
    public async Task SendAction(string roomId, string actionType, object? payload)
    {
        var connectionId = Context.ConnectionId;
        var sender = _clients.GetValueOrDefault(connectionId);
        
        _logger.LogInformation("🎮 Action from {ConnectionId} ({Role}): {ActionType} to room {RoomId}", 
            connectionId, sender?.Role ?? "unknown", actionType, roomId);
        
        // Envoyer uniquement aux "screens" de la room (pas aux autres controllers)
        var screenConnections = _clients.Values
            .Where(c => c.RoomId == roomId && c.Role == "screen" && c.ConnectionId != connectionId)
            .Select(c => c.ConnectionId)
            .ToList();
        
        if (screenConnections.Any())
        {
            await Clients.Clients(screenConnections).SendAsync("ReceiveAction", new
            {
                actionType,
                payload,
                senderId = connectionId,
                senderRole = sender?.Role,
                senderDevice = sender?.DeviceType,
                timestamp = DateTime.UtcNow
            });
            
            _logger.LogInformation("📤 Action sent to {Count} screens", screenConnections.Count);
        }
        else
        {
            _logger.LogWarning("⚠️ No screens found in room {RoomId}", roomId);
        }
    }
    
    /// <summary>
    /// Un écran envoie une mise à jour d'état vers les contrôleurs
    /// </summary>
    public async Task SendStateUpdate(string roomId, string stateType, object? data)
    {
        var connectionId = Context.ConnectionId;
        var sender = _clients.GetValueOrDefault(connectionId);
        
        _logger.LogInformation("📺 State update from {ConnectionId} ({Role}): {StateType}", 
            connectionId, sender?.Role ?? "unknown", stateType);
        
        // Envoyer aux contrôleurs de la room
        var controllerConnections = _clients.Values
            .Where(c => c.RoomId == roomId && c.Role == "controller" && c.ConnectionId != connectionId)
            .Select(c => c.ConnectionId)
            .ToList();
        
        await Clients.Clients(controllerConnections).SendAsync("ReceiveStateUpdate", new
        {
            stateType,
            data,
            senderId = connectionId,
            timestamp = DateTime.UtcNow
        });
    }

    // ==================== RÉTROCOMPATIBILITÉ (anciennes méthodes) ====================

    /// <summary>
    /// Demande de récupération des projets (mobile vers desktop)
    /// </summary>
    public async Task RequestProjectsData()
    {
        var connectionId = Context.ConnectionId;
        var requester = _clients.GetValueOrDefault(connectionId);
        
        _logger.LogInformation("📥 Projects data requested by {ConnectionId} ({Role})", 
            connectionId, requester?.Role ?? "unknown");
        
        var roomId = requester?.RoomId;
        
        // Si pas de room (mode standalone), broadcast à TOUS les desktops
        if (string.IsNullOrEmpty(roomId))
        {
            _logger.LogInformation("🌍 No room - broadcasting to ALL desktop clients (standalone mode)");
            var allDesktopClients = _clients.Values
                .Where(c => c.DeviceType == "desktop" && c.ConnectionId != connectionId)
                .Select(c => c.ConnectionId)
                .ToList();
            
            if (allDesktopClients.Any())
            {
                await Clients.Clients(allDesktopClients).SendAsync("ProjectsDataRequested", new
                {
                    requesterId = connectionId,
                    timestamp = DateTime.UtcNow,
                    standalone = true
                });
                _logger.LogInformation("📤 Projects request sent to {Count} desktop clients (global)", allDesktopClients.Count);
            }
            else
            {
                _logger.LogWarning("⚠️ No desktop clients found at all");
            }
            return;
        }
        
        // Sinon, chercher dans la room spécifique
        var desktopClients = _clients.Values
            .Where(c => c.RoomId == roomId && c.DeviceType == "desktop" && c.ConnectionId != connectionId)
            .Select(c => c.ConnectionId)
            .ToList();
        
        if (desktopClients.Any())
        {
            await Clients.Clients(desktopClients).SendAsync("ProjectsDataRequested", new
            {
                requesterId = connectionId,
                timestamp = DateTime.UtcNow
            });
            _logger.LogInformation("📤 Projects data request sent to {Count} desktop clients", desktopClients.Count);
        }
        else
        {
            _logger.LogWarning("⚠️ No desktop clients found in room {RoomId}", roomId);
        }
    }
    
    /// <summary>
    /// Broadcast des projets du desktop vers les mobiles
    /// </summary>
    public async Task BroadcastProjects(string projectsJson)
    {
        var connectionId = Context.ConnectionId;
        var sender = _clients.GetValueOrDefault(connectionId);
        
        _logger.LogInformation("📤 Broadcasting projects from {ConnectionId} ({Role})", 
            connectionId, sender?.Role ?? "unknown");
        
        var roomId = sender?.RoomId;
        
        // Si pas de room (mode standalone), broadcast à TOUS les mobiles
        if (string.IsNullOrEmpty(roomId))
        {
            _logger.LogInformation("🌍 No room - broadcasting to ALL mobile clients (standalone mode)");
            var allMobileClients = _clients.Values
                .Where(c => c.DeviceType == "mobile" && c.ConnectionId != connectionId)
                .Select(c => c.ConnectionId)
                .ToList();
            
            if (allMobileClients.Any())
            {
                await Clients.Clients(allMobileClients).SendAsync("ReceiveProjects", projectsJson);
                _logger.LogInformation("📤 Projects sent to {Count} mobile clients (global)", allMobileClients.Count);
            }
            else
            {
                _logger.LogWarning("⚠️ No mobile clients found at all");
            }
            return;
        }
        
        // Sinon, envoyer dans la room spécifique
        var mobileClients = _clients.Values
            .Where(c => c.RoomId == roomId && c.DeviceType == "mobile" && c.ConnectionId != connectionId)
            .Select(c => c.ConnectionId)
            .ToList();
        
        if (mobileClients.Any())
        {
            await Clients.Clients(mobileClients).SendAsync("ReceiveProjects", projectsJson);
            _logger.LogInformation("📤 Projects sent to {Count} mobile clients", mobileClients.Count);
        }
        else
        {
            _logger.LogWarning("⚠️ No mobile clients found in room {RoomId}", roomId);
        }
    }

    /// <summary>
    /// Envoie un message à tous les clients connectés
    /// </summary>
    public async Task SendMessage(string message)
    {
        _logger.LogInformation("📨 Message received: {Message}", message);
        await Clients.All.SendAsync("ReceiveMessage", message);
    }

    /// <summary>
    /// Envoie une notification de scène aux clients
    /// </summary>
    public async Task SendSceneUpdate(string sceneId)
    {
        _logger.LogInformation("🎬 Scene update: {SceneId}", sceneId);
        await Clients.AllExcept(Context.ConnectionId).SendAsync("ReceiveSceneUpdate", sceneId);
    }

    // ==================== ÉVÉNEMENTS DE CONNEXION ====================

    /// <summary>
    /// Notification de connexion d'un nouveau client
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        var connectionId = Context.ConnectionId;
        _logger.LogInformation("✅ Client connected: {ConnectionId}", connectionId);
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Notification de déconnexion d'un client
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;
        _logger.LogInformation("❌ Client disconnected: {ConnectionId}", connectionId);
        
        // Récupérer les infos du client avant de le supprimer
        if (_clients.TryRemove(connectionId, out var clientInfo))
        {
            // Notifier les autres membres de la room
            if (!string.IsNullOrEmpty(clientInfo.RoomId))
            {
                await Clients.Group(clientInfo.RoomId).SendAsync("ClientLeftRoom", new
                {
                    connectionId,
                    role = clientInfo.Role,
                    deviceType = clientInfo.DeviceType,
                    timestamp = DateTime.UtcNow
                });
                
                // Mettre à jour la liste des clients de la room
                await BroadcastRoomClients(clientInfo.RoomId);
            }
        }
        
        await base.OnDisconnectedAsync(exception);
    }
}
