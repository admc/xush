import os
import mozrunner
from mozrunner import global_settings
basedir = os.path.abspath(os.path.dirname(__file__))

global_settings.MOZILLA_PLUGINS = [os.path.join(basedir, 'xush/extension'), basedir+'/venk.xpi']

moz = mozrunner.get_moz_from_settings()

moz.start()
