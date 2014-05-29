from pyramid.events import (
     NewRequest,
     BeforeRender,
     subscriber
     )

from .models import (
    DBSession,
    Project,
    )

@subscriber(BeforeRender)
def mysubscriber(event):
  request = event['request']

  event['url'] = request.route_url
  event['static_url'] = request.static_url
  event['logged_in'] = request.authenticated_userid

