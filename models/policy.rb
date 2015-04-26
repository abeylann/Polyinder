class Policy < ActiveRecord::Base
  has_many :impacts
  has_many :votes

  def present
    puts impacts
    i = impacts.collect { |i| i.present} unless impacts == nil
    {
      id: id,
      title: name,
      pledged: pledged,
      yes: votes.where(yes: true).count,
      no: votes.where(yes: false).count,
      picture: image_url,
      impact: i
    }
  end
end
