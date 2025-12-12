const fs = require('fs');
const http = require('http');

console.log('🔄 Generating Postman Collection from Swagger...\n');
console.log('Make sure the server is running on http://localhost:3000\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/docs-json',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const swaggerJson = JSON.parse(data);

      const postmanCollection = {
        info: {
          name: 'Country Delight API',
          description: 'Complete API collection for Country Delight Clone',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        auth: {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{access_token}}',
              type: 'string'
            }
          ]
        },
        variable: [
          {
            key: 'base_url',
            value: 'http://localhost:3000/api/v1',
            type: 'string'
          },
          {
            key: 'access_token',
            value: '',
            type: 'string'
          }
        ],
        item: []
      };

      // Convert Swagger to Postman format
      Object.keys(swaggerJson.paths).forEach((path) => {
        const pathItem = swaggerJson.paths[path];
        Object.keys(pathItem).forEach((method) => {
          const operation = pathItem[method];
          const tag = operation.tags?.[0] || 'Other';

          let folder = postmanCollection.item.find((f) => f.name === tag);
          if (!folder) {
            folder = {
              name: tag,
              item: []
            };
            postmanCollection.item.push(folder);
          }

          const request = {
            name: operation.summary || `${method.toUpperCase()} ${path}`,
            request: {
              method: method.toUpperCase(),
              header: [],
              url: {
                raw: `{{base_url}}${path}`,
                host: ['{{base_url}}'],
                path: path.split('/').filter(p => p)
              }
            }
          };

          // Add body if needed
          if (operation.requestBody) {
            request.request.header.push({
              key: 'Content-Type',
              value: 'application/json'
            });
            request.request.body = {
              mode: 'raw',
              raw: JSON.stringify(operation.requestBody.content?.['application/json']?.example || {}, null, 2)
            };
          }

          folder.item.push(request);
        });
      });

      fs.writeFileSync('postman-collection.json', JSON.stringify(postmanCollection, null, 2));
      console.log('✅ Postman collection generated successfully!');
      console.log('📁 File saved as: postman-collection.json\n');
      console.log('Import this file into Postman to get started.\n');
    } catch (error) {
      console.error('❌ Error generating collection:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error connecting to server:', error.message);
  console.log('\n💡 Make sure the server is running: npm run start:dev\n');
});

req.end();
