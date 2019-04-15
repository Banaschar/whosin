import subprocess
import serverConfig as cfg

def runServer():
    if cfg.SERVER == 'development':
        flask_runner = Process(target=app.run, args=(cfg.BIND_ADDRESS, int(cfg.FLASK_PORT)))
        flask_runner.start()
    else:
        # gunicorn for production performance
        run_flask = ['gunicorn', '-w', '4', 'appserver:app', '-b', cfg.BIND_ADDRESS + ":" + cfg.FLASK_PORT,
                         '--error-logfile', 'gunicorn.log']
        flask_runner = subprocess.Popen(run_flask)
    print("Started and done...\n")

if __name__ == '__main__':
    from appserver import app
    start = runServer()
    #app.run()