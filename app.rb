require 'sinatra'
require 'sinatra/activerecord'
require './models/user'
require './models/policy'
require 'braintree'

set :database, ENV['DATABASE_URL']

get '/' do
  "Works!"  
end

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


