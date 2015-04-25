require './app'
require 'braintree'

Braintree::Configuration.environment = :sandbox
Braintree::Configuration.merchant_id = ENV['BT_ACCOUNT_ID']
Braintree::Configuration.public_key = ENV['BT_PUBLIC_KEY']
Braintree::Configuration.private_key = ENV['BT_PRIVATE_KEY']

run Sinatra::Application
