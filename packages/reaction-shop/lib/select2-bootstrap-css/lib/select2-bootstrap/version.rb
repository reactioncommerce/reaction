require 'json'

module Select2
  module Bootstrap
    VERSION = JSON.parse(File.read(File.expand_path('../../../package.json', __FILE__)))['version']
  end
end
