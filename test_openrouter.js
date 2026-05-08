fetch('https://openrouter.ai/api/v1/models')
  .then(res => res.json())
  .then(data => {
    const sonnet = data.data.find(m => m.id === 'anthropic/claude-3.5-sonnet');
    console.log(JSON.stringify(sonnet, null, 2));
  });
