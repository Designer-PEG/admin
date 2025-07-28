/**
 * Fetches data from multiple Google Sheets Apps Script web apps
 * and combines them with source identifiers.
 */

// Configuration for all the data sources
const dataSources = [
  {
    name: 'Career Subscription - Professional Edge Global',
    url: 'https://script.google.com/macros/s/AKfycby4kMORYTPDmHJr3iaFK05KP4CBNvDGFHub5Xr2xSiOM4BWB0GRZlIFtryUYs3395AT/exec',
    fields: ['email', 'timestamp']
  },
  {
    name: 'Email Subscription List - Professional Edge Global',
    url: 'https://script.google.com/macros/s/AKfycbxCp-x-8CKOAGxO2A_0xw09tIXWoMLVBaaPxVhtDA-30Etw8mc2Mk1auK0yPdJML74/exec',
    fields: ['email', 'timestamp']
  },
  {
    name: 'Consultation Emails - S. Suresh & Associates',
    url: 'https://script.google.com/macros/s/AKfycbx_EpZLawq48T5aAC8nl3qy_NIlCs0zWaQyGtZotziClOyKlpR0oHcUMsAeb76xhdKu/exec',
    fields: ['email', 'timestamp']
  },
  {
    name: 'Contact Form Submission - Professional Edge Global',
    url: 'https://script.google.com/macros/s/AKfycbxPingtSPIPmWQnzicm3MTKNEKJkAcxbY3z-ytPYm15319ZP1pAu_kh_5YvqG35CxoP/exec',
    fields: ['name', 'email', 'company', 'message']
  },
  {
    name: 'Contact Form Submission - S. Suresh & Associates',
    url: 'https://script.google.com/macros/s/AKfycbwdN3RsbBL9870hsny1l0IRzqjgi6H-565LXpbI8yEwM5Od1tRlIcohjMzf78WxC-og/exec',
    fields: ['name', 'email', 'subject', 'message']
  }
];

/**
 * Fetches data from a single Google Sheets web app
 * @param {Object} source - The source configuration
 * @returns {Promise<Array>} - Array of data rows with source information
 */
async function fetchFromSource(source) {
  try {
    const response = await fetch(source.url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Add source information to each row
    return data.map(row => ({
      ...row,
      _source: source.name,
      _fields: source.fields
    }));
  } catch (error) {
    console.error(`Error fetching data from ${source.name}:`, error);
    return []; // Return empty array if there's an error
  }
}

/**
 * Fetches data from all sources and combines them
 * @returns {Promise<Array>} - Combined array of all data with source information
 */
async function fetchAllData() {
  try {
    // Fetch data from all sources concurrently
    const allData = await Promise.all(dataSources.map(fetchFromSource));
    
    // Combine all arrays into one
    const combinedData = allData.flat();
    
    console.log('Successfully fetched data from all sources');
    return combinedData;
  } catch (error) {
    console.error('Error fetching combined data:', error);
    return [];
  }
}

// Example usage:
// fetchAllData().then(data => console.log(data));

// Export the functions if using as a module
export { fetchAllData, fetchFromSource };