module.exports = (sequelize, Sequelize) => {
  return sequelize.define('facebook', {
    postId: {
      type: Sequelize.STRING(30),
      allowNull: false,
    },
    media: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    writer: {
      type: Sequelize.STRING(30),
      allowNull: false,
    },
  });
};