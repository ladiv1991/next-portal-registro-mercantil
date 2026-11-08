#!/bin/bash
set -e
BASE="http://localhost:3003"

echo "=== Getting CAPTCHA ==="
CAP=$(curl -s "$BASE/api/captcha/new")
ID=$(echo "$CAP" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
SVG=$(echo "$CAP" | sed -n 's/.*"svg":"\([^"]*\)".*/\1/p')
ANS=$(echo "$SVG" | grep -oP '>\K[a-zA-Z2-9](?=<\/text>)' | tr -d '\n')
echo "ID=$ID ANSWER=$ANS"

echo ""
echo "=== Login as admin ==="
LOGIN=$(curl -s -c /tmp/cookies.txt -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3003" \
  -d "{\"email\":\"admin@registromercantil.cu\",\"password\":\"Admin2026!\",\"captchaId\":\"$ID\",\"captchaAnswer\":\"$ANS\"}")
echo "$LOGIN"
echo "Cookies: $(cat /tmp/cookies.txt)"

echo ""
echo "=== CMS no-auth ==="
curl -s -w "\nHTTP %{http_code}" "$BASE/api/cms/services"

echo ""
echo "=== CMS admin ==="
curl -s -w "\nHTTP %{http_code}" -b /tmp/cookies.txt "$BASE/api/cms/services" | head -c 200

echo ""
echo "=== Portal-users admin ==="
curl -s -w "\nHTTP %{http_code}" -b /tmp/cookies.txt "$BASE/api/cms/portal-users" | head -c 200

echo ""
echo "=== Upload no-auth ==="
curl -s -w "\nHTTP %{http_code}" -X POST "$BASE/api/upload"

echo ""
echo "=== CAPTCHA invalid token ==="
curl -s -X POST "$BASE/api/captcha/verify" -H "Content-Type: application/json" -d '{"id":"nonexistent","answer":"x"}'

echo ""
echo "=== CAPTCHA missing params ==="
curl -s -w "\nHTTP %{http_code}" -X POST "$BASE/api/captcha/verify" -H "Content-Type: application/json" -d '{}'