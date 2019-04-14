from appserver import app
from flask import redirect, render_template, send_from_directory, jsonify, request
import os
import logging
import requests

logging.basicConfig(level=os.environ.get("LOGLEVEL", "INFO"))
fh = logging.FileHandler(os.path.join(app.root_path, 'debug.log'))
logger = logging.getLogger()
logger.addHandler(fh)


@app.route('/')
def root():
    return redirect('index')

@app.route('/index')
def start():
    with open('config.json', 'r') as f:
        conf = f.read().replace('\n', '')
    #app.instance_path for gunicorn
    logger.info('Serving...')
    assetList = os.listdir(os.path.join(app.root_path, 'static/assets'))
    return render_template('index.html', config=conf, assets=assetList)

@app.route('/getAsset/<path:path>')
def serveAssets(path):
    logger.info('Log Request Path: {}'.format(path))
    return send_from_directory('static/assets', path)

@app.route('/getData/<path:target>')
def requestAPdata(target):
    # TODO: Maybe check target url, so it can't be spoofed
    logger.info('Target: {}'.format(target))
    resp = requests.get(target, params=request.args, stream=True)
    return resp.raw.read(), resp.status_code, resp.headers.items()