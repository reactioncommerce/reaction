# encoding: utf-8

$:.unshift File.expand_path('../lib', __FILE__)
require 'select2-bootstrap/version'

Gem::Specification.new do |s|
  s.name          = "select2-bootstrap-css"
  s.version       = Select2::Bootstrap::VERSION
  s.authors       = ["Michael Hellein"]
  s.email         = ["themichael@gmail.com"]
  s.homepage      = "https://github.com/t0m/select2-bootstrap-css"
  s.summary       = "A stylesheet for making select2 fit in with bootstrap a bit better."
  s.description   = "A stylesheet for making select2 fit in with bootstrap a bit better."
  s.license       = 'MIT'

  s.files         = `git ls-files compass lib`.split("\n")
  s.platform      = Gem::Platform::RUBY
  s.require_paths = ['lib']
  s.rubyforge_project = '[none]'

  s.add_dependency 'json'
  s.add_development_dependency 'jekyll'
end
