const fetch = require('node-fetch');

async function test() {
  const apiKey = '56f450c0b96477d35a2e0a34283b97bb212b3cec79d6a32454ff2db93f12658b4d2bec5be3e809f309d902ecf52c381cf40e7885423005438d7cb92b056de367';
  const payload = {
    query: {
      termo: [],
      atividade_principal: ['4711302'],
      municipio: ['Bento Gonçalves']
    }
  };

  try {
    const res = await fetch('https://api.casadosdados.com.br/v2/public/cnpj/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
    console.log('public status:', res.status);
    console.log('public text:', (await res.text()).substring(0, 100));
  } catch(e) { console.error(e); }

  try {
    const res = await fetch('https://api.casadosdados.com.br/v2/cnpj/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
    console.log('private status:', res.status);
    console.log('private text:', (await res.text()).substring(0, 100));
  } catch(e) { console.error(e); }
}

test();
