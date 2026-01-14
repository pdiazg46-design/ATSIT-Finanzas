@echo off
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" > auth_secret.txt
echo Secret generated in auth_secret.txt
