#!/usr/bin/python3

import subprocess
import serverConfig as cfg

def runServer():
    if cfg.SERVER == 'development':
        flask_runner = app.run()
    else:
        # gunicorn for production performance
        run_flask = ['gunicorn', '-w', '4', 'appserver:app', '-b', cfg.BIND_ADDRESS + ":" + cfg.FLASK_PORT,
                         '--error-logfile', 'gunicorn.log', '--log-level', cfg.LOG_LEVEL]
        flask_runner = subprocess.Popen(run_flask)
    print("Started and done...\n")

if __name__ == '__main__':
    from appserver import app
    start = runServer()