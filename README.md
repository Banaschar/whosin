# Who's in - Studio Tracking

# Install

## For latest build
```bash
npm install
npm run build
```
To use the development server run:
```bash
npm start
```

## Using current build in repo
```bash
pip3 install -r requirements.txt
sudo apt-get install gunicorn // Optional, for faster production server
```
\
Adjust settings in serverConfig.py and run:
```bash
python3 deploy.py
```
Choosing SERVER = 'production' in serverConfig.py will use gunicorn, choosing 'development' will use the flask mini server.