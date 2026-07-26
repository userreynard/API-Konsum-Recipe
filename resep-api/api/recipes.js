export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const response = await fetch('https://dummyjson.com/recipes?limit=50');
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari dummyjson');
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ message: 'Gagal mengambil data API' });
  }
}
