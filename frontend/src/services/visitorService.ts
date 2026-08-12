export const getVisitorCount = async (): Promise<number> => {
  try {
    const response = await fetch('https://abacus.jasoncameron.dev/get/nivasaai/teaser');
    if (!response.ok) throw new Error('Failed to fetch count');
    const data = await response.json();
    return data.value || 0;
  } catch (error) {
    console.error('Visitor Counter API Error:', error);
    throw error;
  }
};

export const incrementVisitorCount = async (): Promise<number> => {
  try {
    const response = await fetch('https://abacus.jasoncameron.dev/hit/nivasaai/teaser');
    if (!response.ok) throw new Error('Failed to increment count');
    const data = await response.json();
    return data.value || 0;
  } catch (error) {
    console.error('Visitor Counter API Error:', error);
    throw error;
  }
};
