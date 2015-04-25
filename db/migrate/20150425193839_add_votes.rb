class AddVotes < ActiveRecord::Migration
  def change
    create_table :votes do |t|
      t.string :session_id
      t.integer :policy_id
      t.boolean :yes
      t.timestamp 
    end
  end
end
