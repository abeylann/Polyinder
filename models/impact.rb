class Impact < ActiveRecord::Base
  belongs_to :policy

  def present
    {
      id: id,
      title: title,
      yes: yes,
      no: no
    }
  end

end