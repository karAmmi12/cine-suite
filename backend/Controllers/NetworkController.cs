using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

namespace CineSuite.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NetworkController : ControllerBase
{
    /// <summary>
    /// Récupère l'adresse IP locale (LAN) du serveur
    /// </summary>
    [HttpGet("ip")]
    public IActionResult GetLocalIp()
    {
        try
        {
            var localIp = GetLocalIPAddress();
            return Ok(new
            {
                ip = localIp,
                port = 5001,
                url = $"http://{localIp}:5001",
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Détecte l'IP locale sur le réseau LAN (Wi-Fi ou Ethernet)
    /// </summary>
    private string GetLocalIPAddress()
    {
        // Récupère toutes les interfaces réseau actives
        var networkInterfaces = NetworkInterface.GetAllNetworkInterfaces()
            .Where(ni => ni.OperationalStatus == OperationalStatus.Up &&
                         ni.NetworkInterfaceType != NetworkInterfaceType.Loopback)
            .ToList();

        foreach (var ni in networkInterfaces)
        {
            var ipProps = ni.GetIPProperties();
            
            // Recherche une IPv4 non-loopback
            var ipv4Address = ipProps.UnicastAddresses
                .FirstOrDefault(addr => addr.Address.AddressFamily == AddressFamily.InterNetwork &&
                                       !IPAddress.IsLoopback(addr.Address));

            if (ipv4Address != null)
            {
                return ipv4Address.Address.ToString();
            }
        }

        // Fallback : méthode alternative
        var host = Dns.GetHostEntry(Dns.GetHostName());
        var fallbackIp = host.AddressList
            .FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork);

        return fallbackIp?.ToString() ?? "127.0.0.1";
    }
}
