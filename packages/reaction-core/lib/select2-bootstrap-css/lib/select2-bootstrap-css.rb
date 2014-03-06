require 'compass'

module Select2
  module Bootstrap
    def self.base_directory
      File.expand_path('../../compass', __FILE__)
    end
  end
end

Compass::Frameworks.register 'select2-bootstrap', :path => Select2::Bootstrap.base_directory