class Impacts < ActiveRecord::Migration
  def change
    create_table :impacts do |t|
      t.text :title
      t.integer :yes
      t.integer :no
    end
  end
end
