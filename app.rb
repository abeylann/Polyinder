require 'sinatra'
require 'sinatra/activerecord'
require 'braintree'

set :database, ENV['DATABASE_URL']

get '/' do
  "Works!"  
end

get '/policy' do
  @policy
end

get '/dashboard' do

end

get '/bt_webhook' do
 challenge = params["bt_challenge"]
  challenge_response = Braintree::WebhookNotification.verify(challenge)
  return [200, challenge_response]
end

# When we sign up a new person who wants to donate money.
gpost '/complete_signup' do
  Braintree::Configuration.environment = :sandbox
  Braintree::Configuration.merchant_id = ENV['BT_MERCHANT_ID']
  Braintree::Configuration.public_key = ENV['BT_PUBLIC_KEY']
  Braintree::Configuration.private_key = ENV['BT_PRIVATE_KEY']

  @result = Braintree::MerchantAccount.create(
    :individual => {
      :first_name => params[:first_name],
      :last_name => params[:last_name],
      :email => params[:email],
      :date_of_birth => params[:dob],
      :address => {
        :street_address => params[:street],
        :locality => params[:city],
        :region => params[:region],
        :postal_code => params[:postal_code]
      }
    },
    :funding => {
      :descriptor => "Polyinder",
      :destination => Braintree::MerchantAccount::FundingDestination::Email,
      :email => params[:email],
    },
    :tos_accepted => true,
    :master_merchant_account_id => ENV['BT_MERCHANT_ID'],
    :id => "Polyinder"
  )
  User.create(bt_merchant_id: result.id, bt_merchant_state: result.status, email: params[:email])
  erb :pending
end


