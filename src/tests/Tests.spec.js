import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

export const getCharactersDuration = new Trend('get_characters_duration', true);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700']
  },
  stages: [
    { duration: '05s', target: 10 },
    { duration: '25s', target: 10 },

    { duration: '25s', target: 20 },
    { duration: '45s', target: 20 },

    { duration: '25s', target: 50 },
    { duration: '55s', target: 50 },

    { duration: '25s', target: 100 },
    { duration: '55s', target: 100 },

    { duration: '35s', target: 300 },
    { duration: '5s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/disney_api_test.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://api.disneyapi.dev/character';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const res = http.get(baseUrl, params);

  getCharactersDuration.add(res.timings.duration);

  check(res, {
    'GET Characters - Status 200': () => res.status === 200
  });
}
