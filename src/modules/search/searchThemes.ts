export type SearchTheme = 'modern' | 'retro-2000' | 'retro-90' | 'yahoo-2005' | 'altavista-98' | 'windows-98' | 'hacker-terminal';

export interface SearchPageStyles {
  homeBg: string;
  homeFont: string;
  logoColor: string;
  searchBar: string;
  searchIcon: boolean;
  cursor: string;
  button: string;
  resultsBg: string;
  resultsHeader: string;
  resultsInput: string;
}

export interface SearchResultStyles {
  container: string;
  stats: string;
  url: string;
  title: string;
  snippet: string;
}

export interface SearchViewerStyles {
  bg: string;
  header: string;
  headerText: string;
  button: string;
  title: string;
  date: string;
  body: string;
  container: string;
  font: string;
}

export interface SearchThemeConfig {
  page: SearchPageStyles;
  results: SearchResultStyles;
  viewer: SearchViewerStyles;
}

const themes: Record<SearchTheme, SearchThemeConfig> = {
  'modern': {
    page: {
      homeBg: 'bg-white',
      homeFont: 'font-sans',
      logoColor: '#4285F4',
      searchBar: 'h-14 rounded-full border border-gray-200 hover:shadow-lg px-5',
      searchIcon: true,
      cursor: 'w-0.5 h-6 bg-blue-500',
      button: 'px-6 py-2 bg-gray-50 rounded hover:bg-gray-100',
      resultsBg: 'bg-white',
      resultsHeader: 'bg-white border-b border-gray-200 px-4 py-3 shadow-sm',
      resultsInput: 'h-10 pl-4 pr-10 rounded-full bg-white shadow-sm ring-1 ring-gray-200'
    },
    results: {
      container: 'bg-white font-sans',
      stats: 'text-gray-500 text-sm',
      url: 'text-green-700 text-sm',
      title: 'text-[#1a0dab] text-xl font-normal group-hover:underline',
      snippet: 'text-gray-600 text-sm'
    },
    viewer: {
      bg: 'bg-white',
      header: 'bg-white border-gray-200 shadow-sm',
      headerText: 'text-gray-500',
      button: 'text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-full',
      title: 'text-3xl font-bold text-gray-900',
      date: 'text-gray-500 text-sm',
      body: 'text-gray-800 prose-slate',
      container: 'bg-white',
      font: 'font-sans'
    }
  },

  'yahoo-2005': {
    page: {
      homeBg: 'bg-gradient-to-b from-purple-600 to-purple-800',
      homeFont: 'font-sans',
      logoColor: 'white',
      searchBar: 'h-12 border-2 border-purple-900 bg-white px-4 rounded-lg shadow-xl',
      searchIcon: false,
      cursor: 'w-1 h-6 bg-purple-600',
      button: 'px-6 py-2 bg-purple-700 text-white rounded-lg font-bold hover:bg-purple-600 shadow-lg',
      resultsBg: 'bg-purple-50',
      resultsHeader: 'bg-purple-700 border-b-4 border-purple-900 px-4 py-3',
      resultsInput: 'h-10 pl-4 pr-10 border-2 border-purple-900 bg-white rounded-lg'
    },
    results: {
      container: 'bg-white font-sans',
      stats: 'text-purple-700 text-sm font-bold bg-purple-50 p-2 rounded',
      url: 'text-green-600 text-xs font-bold',
      title: 'text-purple-900 text-lg font-bold group-hover:underline',
      snippet: 'text-gray-700 text-sm'
    },
    viewer: {
      bg: 'bg-purple-50',
      header: 'bg-purple-700 text-white border-b-4 border-purple-900',
      headerText: 'text-purple-100',
      button: 'bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500 font-bold',
      title: 'text-2xl font-black text-purple-900 uppercase',
      date: 'text-purple-700 text-xs font-bold',
      body: 'text-gray-900 leading-relaxed',
      container: 'bg-white border-4 border-purple-300 p-6',
      font: 'font-sans'
    }
  },

  'retro-2000': {
    page: {
      homeBg: 'bg-gradient-to-b from-blue-100 to-blue-200',
      homeFont: 'font-sans',
      logoColor: '#003399',
      searchBar: 'h-10 border-2 border-blue-800 bg-white px-3',
      searchIcon: false,
      cursor: 'w-1 h-5 bg-blue-800',
      button: 'px-5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-600 border border-blue-900',
      resultsBg: 'bg-blue-50',
      resultsHeader: 'bg-blue-700 border-b-2 border-blue-900 px-4 py-2',
      resultsInput: 'h-8 pl-3 border-2 border-blue-900 bg-white'
    },
    results: {
      container: 'bg-[#f0f4ff] font-sans',
      stats: 'text-blue-800 text-sm font-medium bg-blue-100 px-3 py-1 inline-block border-l-4 border-blue-600',
      url: 'text-blue-600 text-xs underline',
      title: 'text-blue-900 text-lg font-semibold group-hover:text-blue-600',
      snippet: 'text-gray-800 text-sm'
    },
    viewer: {
      bg: 'bg-blue-50',
      header: 'bg-blue-700 text-white border-b-2 border-blue-900',
      headerText: 'text-blue-100',
      button: 'bg-blue-600 text-white px-3 py-1 hover:bg-blue-500 font-semibold',
      title: 'text-2xl font-bold text-blue-900',
      date: 'text-blue-600 text-sm',
      body: 'text-gray-900',
      container: 'bg-white border border-blue-300 p-6',
      font: 'font-sans'
    }
  },

  'altavista-98': {
    page: {
      homeBg: 'bg-[#ffffcc]',
      homeFont: 'font-sans',
      logoColor: '#0000ee',
      searchBar: 'h-10 border-2 border-black bg-white px-2',
      searchIcon: false,
      cursor: 'w-2 h-5 bg-black',
      button: 'px-4 py-2 bg-yellow-300 border-2 border-black font-bold hover:bg-yellow-200',
      resultsBg: 'bg-[#ffffcc]',
      resultsHeader: 'bg-[#ffff99] border-b-2 border-black px-4 py-2',
      resultsInput: 'h-8 pl-2 border-2 border-black bg-white font-mono'
    },
    results: {
      container: 'bg-[#ffffcc] font-sans',
      stats: 'text-black text-sm font-mono bg-yellow-200 px-2 py-1 border border-black',
      url: 'text-[#0000ee] text-sm underline font-mono',
      title: 'text-[#0000ee] text-xl underline font-bold',
      snippet: 'text-black text-sm leading-relaxed'
    },
    viewer: {
      bg: 'bg-[#ffffcc]',
      header: 'bg-[#ffff99] border-b-2 border-black',
      headerText: 'text-black font-mono',
      button: 'bg-yellow-300 text-black px-2 py-1 border-2 border-black font-bold',
      title: 'text-3xl font-black text-[#0000ee] underline',
      date: 'text-black text-xs font-mono bg-yellow-200 px-2',
      body: 'text-black font-serif leading-loose',
      container: 'bg-white border-4 border-black p-6',
      font: 'font-sans'
    }
  },

  'windows-98': {
    page: {
      homeBg: 'bg-[#008080]',
      homeFont: 'font-sans',
      logoColor: '#000080',
      searchBar: 'h-10 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white px-2',
      searchIcon: false,
      cursor: 'w-2 h-5 bg-black',
      button: 'px-4 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold active:border-t-[#808080] active:border-l-[#808080] active:border-r-white active:border-b-white',
      resultsBg: 'bg-[#008080]',
      resultsHeader: 'bg-[#000080] border-b-2 border-white px-4 py-2',
      resultsInput: 'h-8 pl-2 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white bg-white'
    },
    results: {
      container: 'bg-[#c0c0c0] font-sans',
      stats: 'text-black text-sm bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] px-2 py-1',
      url: 'text-blue-800 text-sm font-bold',
      title: 'text-navy text-lg font-bold underline',
      snippet: 'text-black text-sm bg-white p-2 border border-gray-500'
    },
    viewer: {
      bg: 'bg-[#008080]',
      header: 'bg-[#000080] text-white border-b-2 border-white',
      headerText: 'text-white font-bold',
      button: 'bg-[#c0c0c0] text-black px-2 border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] font-bold text-xs',
      title: 'text-2xl font-bold text-navy',
      date: 'text-gray-700 text-xs',
      body: 'text-black',
      container: 'bg-white border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080] p-4 m-2',
      font: 'font-sans'
    }
  },

  'retro-90': {
    page: {
      homeBg: 'bg-[#c0c0c0]',
      homeFont: 'font-serif',
      logoColor: 'black',
      searchBar: 'h-10 border-2 border-gray-600 bg-white pl-2 text-black',
      searchIcon: false,
      cursor: 'w-3 h-5 bg-black',
      button: 'px-4 py-1 border-2 border-white border-r-black border-b-black bg-[#c0c0c0] active:border-t-black active:border-l-black',
      resultsBg: 'bg-[#c0c0c0]',
      resultsHeader: 'bg-[#cccccc] border-b-2 border-black p-2 gap-2',
      resultsInput: 'h-8 border-2 border-inset border-gray-500 bg-white pl-2 font-mono'
    },
    results: {
      container: 'bg-[#c0c0c0] font-serif',
      stats: 'text-red-700 text-sm font-mono bg-gray-200 px-2 py-1 border-2 border-black',
      url: 'text-green-800 text-sm font-mono',
      title: 'text-blue-800 text-xl underline font-black',
      snippet: 'text-black text-base'
    },
    viewer: {
      bg: 'bg-[#c0c0c0]',
      header: 'bg-[#000080] text-white border-b-4 border-gray-400',
      headerText: 'text-yellow-300 font-mono',
      button: 'bg-[#c0c0c0] text-black px-2 border-2 border-white border-b-black border-r-black',
      title: 'text-4xl font-black text-red-600 underline',
      date: 'text-green-700 font-mono text-xs',
      body: 'text-black font-serif leading-loose',
      container: 'bg-white border-2 border-black m-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6',
      font: 'font-serif'
    }
  },

  'hacker-terminal': {
    page: {
      homeBg: 'bg-black',
      homeFont: 'font-mono',
      logoColor: '#00ff00',
      searchBar: 'h-10 border border-green-500 bg-black px-3 text-green-500',
      searchIcon: false,
      cursor: 'w-2 h-5 bg-green-500',
      button: 'px-4 py-1 border border-green-500 text-green-500 hover:bg-green-900 font-mono',
      resultsBg: 'bg-black',
      resultsHeader: 'bg-black border-b border-green-500 px-4 py-2',
      resultsInput: 'h-8 pl-3 border border-green-500 bg-black text-green-500 font-mono'
    },
    results: {
      container: 'bg-black font-mono',
      stats: 'text-green-500 text-xs border border-green-500 px-2 py-1 inline-block',
      url: 'text-green-400 text-xs',
      title: 'text-green-500 text-lg font-bold',
      snippet: 'text-green-300 text-sm opacity-80'
    },
    viewer: {
      bg: 'bg-black',
      header: 'bg-black border-b border-green-500',
      headerText: 'text-green-500 font-mono',
      button: 'text-green-400 hover:text-green-300 px-2 border border-green-500 font-mono text-xs',
      title: 'text-2xl font-bold text-green-500 font-mono',
      date: 'text-green-600 text-xs font-mono',
      body: 'text-green-300 font-mono leading-relaxed',
      container: 'bg-black border border-green-500 p-6 m-4',
      font: 'font-mono'
    }
  }
};

export function getSearchTheme(theme: string): SearchThemeConfig {
  return themes[theme as SearchTheme] || themes['modern'];
}
