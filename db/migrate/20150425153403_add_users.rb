class AddUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :bt_merchant_id
      t.string :bt_merchant_state
      t.text :email
    end
  end
end
