const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

const API_URL = 'https://openapi.work.go.kr/opi/opi/opia/wantedApi.do';

app.get('/api/jobs', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        authKey: 'e40097e2-7560-4ead-8bae-8f1c4e17d46f',
        callTp: 'L',
        returnType: 'JSON',
        startPage: 1,
        display: 10
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching data' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
