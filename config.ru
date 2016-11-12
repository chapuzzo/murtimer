use Rack::Static,
  urls: ['/styles', '/scripts']

run lambda { |env|

  requested_path = env['PATH_INFO']
  allowed_files = %w( /index.html /admin.html /login.html )
  file_to_open = requested_path if allowed_files.include? requested_path || '/index.html'

  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open(".#{file_to_open}", File::RDONLY)
  ]
}
