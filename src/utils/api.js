// utils/api.js
import { dataSources } from './constants';

export const fetchAllData = async () => {
  try {
    const promises = dataSources.map(source => 
      fetch(source.url).then(response => response.json())
    );
    const results = await Promise.all(promises);
    
    return results.flatMap((data, index) => 
      data.map(item => ({ ...item, _source: dataSources[index].name }))
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};