require 'sinatra'
require 'sinatra/activerecord'
require './models/user'
require './models/policy'
require 'braintree'

set :database, ENV['DATABASE_URL']

get '/' do
  "Works!"  
end

get '/policy' do
  @policy
end

get '/dashboard' do
  @users = User.all
  @policies = Policy.all
  erb :dashboard
end

# Braintree perscribed stuff...
get '/bt_webhook' do
  challenge = params["bt_challenge"]
  challenge_response = Braintree::WebhookNotification.verify(challenge)

  notification = Braintree::WebhookNotification.parse(
    params[:bt_signature],
    params[:bt_payload]
  )

  if notification.kind == Braintree::WebhookNotification::Kind::SubMerchantAccountApproved
    user = User.where(bt_merchant_id: notification.merchant_account.id).first
    user.status = notification.merchant_account.status
    user.save
  end
  return [200, challenge_response]
end

# When we sign up a new person who wants to donate money.
# Requires:
#
# first_name
# last_name
# email
# dob
# street
# city
# region
# postal_code
post '/create_user' do
  payload = JSON.parse(request.body.read)
  
  result = Braintree::MerchantAccount.create(
    :individual => {
      :first_name => payload['first_name'],
      :last_name => payload['last_name'],
      :email => payload['email'],
      :date_of_birth => payload['dob'],
      :address => {
        :street_address => payload['street'],
        :locality => payload['city'],
        :region => payload['region'],
        :postal_code => payload['postal_code']
      }
    },
    :funding => {
      :descriptor => "Polyinder",
      :destination => Braintree::MerchantAccount::FundingDestination::Email,
      :email => payload['email'],
    },
    :tos_accepted => true,
    :master_merchant_account_id => 'Polyinder',
  )


  if result.respond_to? 'message'
    puts "Error!!!"
    { status: 'fail', message: result.message }
  else
    puts "OKAY!!!"
    User.create(bt_merchant_id: result.merchant_account.id,
                bt_merchant_state: result.merchant_account.id,
                email: payload['email'])
    { status: 'ok', message: 'Merchant is pending' }
  end
end


