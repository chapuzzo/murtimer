use Rack::Static,
  urls: ['/styles', '/scripts', '/pages', '/lite', '/'],
  index: 'index.html'

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open("./index.html", File::RDONLY)
  ]
}
