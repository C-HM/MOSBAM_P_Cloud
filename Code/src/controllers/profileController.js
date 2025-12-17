import "dotenv/config";
import { queryDatabase } from "../db/dbConnect.js";

const get = async (req, res) => {
  let historique;
  let response;
  let chartData;
  let rawData = [];
  try {
    const user_id = await queryDatabase(
      `SELECT user_id FROM t_user Where username='${req.session.user.username}'`
    );
    const listFav = await queryDatabase(
      `SELECT * FROM t_avoir av JOIN t_sites si ON si.site_id = av.site_id JOIN t_wishlist fav ON fav.wishlist_id = av.liste_favoris_id WHERE fav.user_id = '${req.session.user.user_id}'`
    );
    historique = await queryDatabase(
      `SELECT * FROM t_contenir co JOIN t_sites si ON si.site_id = co.site_id JOIN t_historique hist ON hist.historique_id = co.historique_id WHERE hist.user_id = '${req.session.user.user_id}'`
    );
    const query = `
      SELECT s.continent, COUNT(*) AS nombre_sites
      FROM t_historique lf
      JOIN t_sites s ON lf.site_id = s.site_id
      WHERE lf.user_id = ?
      GROUP BY s.continent;
    `;
    rawData = await queryDatabase(query, [user_id[0].user_id]);
  } catch (error) {
    console.error("Erreur lors de la récupération des sites:", error);
  }
  /*const chartData = {
    labels: ["dsaas", "dsdfaf", "eqwewqe", "dsadasd"],
    values: [10, 20, 30, 40],
  };*/
  // const rawData = await response.json(); // Removed fetch response parsing
  if (rawData != "") {
    chartData = {
      labels: rawData.map((item) => item.continent),
      values: rawData.map((item) => item.nombre_sites),
    };
  }

  res.render("profile", {
    user: req.session.user || null,
    chartData: chartData,
    historique: historique,
  });
};

export { get };
