from pyramid.events import NewRequest, BeforeRender, subscriber

@subscriber(BeforeRender)
def mysubscriber(event):
  request = event['request']
  event['url'] = request.route_url
  event['static_url'] = request.static_url
  event['logged_in'] = request.authenticated_userid

