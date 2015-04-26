class Policy < ActiveRecord::Base
  has_many :impacts
  has_many :votes

  def present
    puts impacts
    i = impacts.collect { |i| i.present} unless impacts == nil
    share = (pledged.to_f/votes.count).round(2) if votes.count > 0 && pledged != 0
    {
      id: id,
      title: name,
      pledged: pledged,
      yes: votes.where(yes: true).count,
      no: votes.where(yes: false).count,
      share: share,
      picture: image_url,
      impact: i
    }
  end
end
