'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // --- Users ---
    await queryInterface.createTable('users', {
      u_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      u_name: { type: Sequelize.STRING, allowNull: false },
      u_email: { type: Sequelize.STRING, allowNull: false, unique: true },
      u_password: { type: Sequelize.STRING, allowNull: false },
      u_role: { type: Sequelize.ENUM('user', 'admin'), allowNull: false },
      u_phone: { type: Sequelize.STRING, allowNull: true },
      newsletter_subscribed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // --- Orders ---
    await queryInterface.createTable('orders', {
      order_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'u_id' }, onDelete: 'CASCADE' },
      ordered_items: { type: Sequelize.JSON, allowNull: false },
      total_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      shipping_method: { type: Sequelize.STRING, allowNull: false, defaultValue: 'standard' },
      shipping_cost: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 4.99 },
      tax_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      order_notes: { type: Sequelize.TEXT, allowNull: true },
      tracking_number: { type: Sequelize.STRING, allowNull: true },
      coupon_code: { type: Sequelize.STRING, allowNull: true },
      discount_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      shipping_address_id: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // --- Payments ---
    await queryInterface.createTable('payments', {
      payment_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'order_id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      payment_method: { type: Sequelize.STRING, allowNull: false, defaultValue: 'cash_on_delivery' },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      refund_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true, defaultValue: null },
      refund_reason: { type: Sequelize.TEXT, allowNull: true },
      paystack_reference: { type: Sequelize.STRING, allowNull: true },
      mobile_money_transaction_id: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // --- Addresses ---
    await queryInterface.createTable('addresses', {
      address_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'u_id' }, onDelete: 'CASCADE' },
      label: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Home' },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      street: { type: Sequelize.STRING, allowNull: false },
      city: { type: Sequelize.STRING, allowNull: false },
      postal_code: { type: Sequelize.STRING, allowNull: false },
      country: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Germany' },
      phone: { type: Sequelize.STRING, allowNull: true },
      is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // --- Return Requests ---
    await queryInterface.createTable('return_requests', {
      return_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'orders', key: 'order_id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'u_id' }, onDelete: 'CASCADE' },
      reason: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      admin_notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // --- Support Tickets ---
    await queryInterface.createTable('support_tickets', {
      ticket_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: false },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'open' },
      priority: { type: Sequelize.STRING, allowNull: false, defaultValue: 'normal' },
      admin_reply: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    // --- Indexes ---
    await queryInterface.addIndex('orders', ['user_id']);
    await queryInterface.addIndex('payments', ['order_id']);
    await queryInterface.addIndex('addresses', ['user_id']);
    await queryInterface.addIndex('return_requests', ['order_id']);
    await queryInterface.addIndex('return_requests', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('support_tickets');
    await queryInterface.dropTable('return_requests');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('users');
  },
};
