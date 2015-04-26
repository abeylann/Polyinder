require 'sinatra'
require 'sinatra/activerecord'
require './models/user'
require './models/policy'
require './models/vote'
require './models/impact'
require 'braintree'
require 'sendgrid-ruby'
require 'twilio-ruby'
set :database, ENV['DATABASE_URL']

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end

get '/register' do
  send_file File.join(settings.public_folder, 'signup.html')
end

get '/clean' do
  Policy.all.each do |p|
    p.destroy
  end
end

get '/notify/:id' do
  p = Policy.find(params[:id])
  total = p.pledged
  share = 0
  share = (p.pledged / p.votes.count).round(2) if p.votes.count > 0

  # using SendGrid's Ruby Library - https://github.com/sendgrid/sendgrid-ruby
  sg = SendGrid::Client.new(api_user: ENV['SENDGRID_USER'], api_key: ENV['SENDGRID_PASS'])
  email = SendGrid::Mail.new do |m|
    m.to      = 'michael@wawra.co.uk'
    m.from    = 'votesthatcount@wawra.co.uk'
    m.subject = "You have been awarded £#{share}!"
    m.html    = 'woo'
  end
  sg.send(email)

  twilio = Twilio::REST::Client.new(ENV['TWILIO_AUTH'], ENV['TWILIO_TOKEN'])
  twilio.account.messages.create(to: '+447804762520', from: '+442071838740', body: "You just paid £#{total} to support your cause!")

  redirect '/dashboard'
end

post '/policy' do
  puts params
  payload = JSON.parse(request.body.read)
  p = Policy.create(name: payload['name'],
                image_url: payload['picture'])
  if payload['impact']
    payload['impact'].each do |i|
      Impact.create(title: i['title'], yes: 0, no: 0, policy_id: p.id)
    end
  end
  p.reload.to_json
end

post "/policy/:id/vote" do
  payload = JSON.parse(request.body.read)
  p = Policy.find(params[:id])
  v = p.votes.where(session_id: payload['session_id'])
  answer = false
  answer = true if payload['vote'] == 'yes'

  if payload.key? 'impacts'
    payload['impacts'].each do |i|
      imp = p.impacts.find(i['id'])
      imp.yes = imp.yes + 1 if i['vote'] == 'yes'
      imp.no = imp.no + 1 if i['vote'] == 'no'
      imp.save
    end
  end

  if !v || v.empty?
    v = Vote.create(policy_id: p.id,
                session_id: payload['session_id'],
                yes: answer)
    puts v.to_json
    p.reload.present.to_json
  else
    { status: 'fail', message: 'Policy/session_id already exists' }.to_json
  end
end

get '/policy/random/:session_id' do
  p = Policy.all.select { |pol| (v = pol.votes.where(session_id: params['session_id'])) && (!v || v.empty?) }
  if p != []
    p.sample.present.to_json
  else
    { status: 'fail', message: 'No policies' }.to_json
  end
end

get '/policy' do
  pol = Policy.all.collect { |p| p.present }
  if pol 
    pol.to_json
  else
    { status: 'fail', message: 'No policies' }.to_json
  end
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
  Braintree::Configuration.environment = :sandbox
  Braintree::Configuration.merchant_id = ENV['BT_ACCOUNT_ID']
  Braintree::Configuration.public_key = ENV['BT_PUBLIC_KEY']
  Braintree::Configuration.private_key = ENV['BT_PRIVATE_KEY']

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


