class Impact < ActiveRecord::Base
  belongs_to :policy

  def present
    {
      title: title,
      yes: yes,
      no: no
    }
  end

end