class AddPolicyToImpacts < ActiveRecord::Migration
  def change
    add_column :impacts, :policy_id, :integer
  end
end
