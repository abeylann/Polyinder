require 'sinatra'
require 'sinatra/activerecord'
require './models/user'
require './models/policy'
require './models/vote'
require './models/impact'
require 'braintree'

set :database, ENV['DATABASE_URL']

get '/' do
  "Works!"  
end

<<<<<<< HEAD
get '/clean' do
  Policy.all.each do |p|
    p.destroy
  end
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

get '/policy/random' do
  p = Policy.all
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
=======
post '/policy/:id' do
  {
    id: params[:id],
    title: 'Should BattleHack be more often than once a year?',
    picture: 'BH.jpg',
    yes: 24,
    no: 13,
    impact: [
        { title: 'BattleHack will stay fun', no: 5, yes: 0 },
        { title: 'BattleHack will remain free', no: 1, yes: 0 },
        { title: 'You can meet your fellow hackers more often', no: 0, yes: 8 }
    ]
  }
end

get '/policy/random' do
  {
    id: params[:id],
    title: 'Should BattleHack be more often than once a year?',
    picture: 'BH.jpg',
    yes: 23,
    no: 12,
    impact: [
        { title: 'BattleHack will stay fun', no: 5, yes: 0 },
        { title: 'BattleHack will remain free', no: 1, yes: 0 },
        { title: 'You can meet your fellow hackers more often', no: 0, yes: 8 }
    ]
  }.to_json
end

get '/policy' do
  [{
      id: '0',
      title: 'Should BattleHack be more often than once a year?',
      picture: 'BH.jpg',
      yes: 23,
      no: 12,
      impact: [
          { title: 'BattleHack will stay fun', no: 5, yes: 0 },
          { title: 'BattleHack will remain free', no: 1, yes: 0 },
          { title: 'You can meet your fellow hackers more often', no: 0, yes: 8 }
      ]
  },
  {
      id: '1',
      title: 'Removal of tuition fees for students taking approved degrees in science, medicine, technology, engineering and maths on condition that they practise and work and pay tax in the UK for five years after graduation.',
      picture: 'TuitionFees.jpg',
      yes: 23,
      no: 12,
      impact: {
          no: [],
          yes: []
      }
  },
  {
      id: '2',
      title: 'UK to leave the European Union. An Australian-style points based system and a five-year ban on unskilled immigration.',
      picture: 'NoEU.png',
      yes: 23,
      no: 12,
      impact: {
          no: [],
          yes: []
      }
  },
  {
      id: '3',
      title: 'Abolish the bedroom tax.',
      picture: 'Bedroom.jpg',
      yes: 23,
      no: 12,
      impact: {
          no: [],
          yes: []
      }
  },
  {
      id: '4',
      title: 'Increase the minimum wage to the living wage of £10 an hour by 2020, and to £8.10 an hour this year.',
      picture: 'Wage.jpg',
      yes: 23,
      no: 12,
      impact: {
          no: [],
          yes: []
      }
  }].to_json
>>>>>>> 58663353e2ac4105f898cf5491570474ceb3fc36
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


