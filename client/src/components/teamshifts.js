import { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

function Worklogs() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/teams');
        const data = response.data;
        console.log(data);
        setLoading(false);
        setMessage('DATA RETRIVED AND SAVED IN THE DATABASE');
      } catch (error) {
        console.log(error);
        setLoading(false);
        setMessage('FAILED TO FETCH AND SAVE DATA');
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress size={130} thickness={5} />
          <div style={{ marginTop: '20px' }}>FETCHING WEEK DATA FROM TEAMS API IN PROGRESS.. IT TAKES A COUPLE OF MINUTES...</div>
        </Box>
      ) : (
        <div>
          {message && <div>{message}</div>}
          {/* Render other components or data */}
        </div>
      )}
    </div>
  );
}

export default Worklogs;
