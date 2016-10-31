# map '/' do
  use Rack::Static,
    urls: ['/styles', '/scripts']

  run lambda { |env|
    [
      200,
      {
        'Content-Type'  => 'text/html',
        'Cache-Control' => 'public, max-age=86400'
      },
      File.open('index.html', File::RDONLY)
      # 'xxx'
    ]
  }

# end
