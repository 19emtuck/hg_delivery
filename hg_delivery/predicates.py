
def to_int(*segment_names):
  def predicate(info, request):
      match = info['match']
      for segment_name in segment_names:
          try:
              match[segment_name] = int(match[segment_name])
          except (TypeError, ValueError):
              pass
      return True
  return predicate
