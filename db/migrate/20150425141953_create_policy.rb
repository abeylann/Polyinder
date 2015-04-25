class CreatePolicy < ActiveRecord::Migration
  def change
    create_table :policies do |t|
      t.string :name
      t.text :description
      t.datetime :deadline
      t.string :image_url
      t.timestamps
    end
  end
end
