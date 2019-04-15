# whosin
Who's in - Studio Tracking

# Install

## For latest build
```bash
npm install
npm run build
```
## Using current build in repo
```bash
pip3 install -r requirements.txt
sudo apt-get install gunicorn // Optional, for faster production server
```
\
Adjust settings like address/port in serverConfig.py and run:
```bash
python3 deploy.py
```