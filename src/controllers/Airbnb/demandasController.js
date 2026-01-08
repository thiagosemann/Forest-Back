// controllers/demandasController.js
const demandasModel = require('../../models/Airbnb/demandasModel');

// Buscar todas as demandas
const getAllDemandas = async (_req, res) => {
	try {
		const demandas = await demandasModel.getAllDemandas();
		return res.status(200).json(demandas);
	} catch (error) {
		console.error('Erro ao obter demandas:', error);
		return res.status(500).json({ error: 'Erro ao obter demandas' });
	}
};

// Buscar uma demanda por ID
const getDemandaById = async (req, res) => {
	try {
		const { id } = req.params;
		const demanda = await demandasModel.getDemandaById(id);
		if (!demanda) {
			return res.status(404).json({ message: 'Demanda não encontrada' });
		}
		return res.status(200).json(demanda);
	} catch (error) {
		console.error('Erro ao buscar demanda:', error);
		return res.status(500).json({ error: 'Erro ao buscar demanda' });
	}
};

// Criar uma nova demanda
const createDemanda = async (req, res) => {
	try {
		const dados = req.body || {};
		// status default definido no model como 'Pendente' quando não enviado
		const result = await demandasModel.createDemanda(dados);
		return res.status(201).json({ message: 'Demanda criada com sucesso', insertId: result.insertId });
	} catch (error) {
		console.error('Erro ao criar demanda:', error);
		return res.status(500).json({ error: 'Erro ao criar demanda' });
	}
};

// Atualizar uma demanda existente
const updateDemanda = async (req, res) => {
	try {
		const { id } = req.params;
		const dados = req.body || {};
		const result = await demandasModel.updateDemanda(id, dados);
		return res.status(200).json(result);
	} catch (error) {
		console.error('Erro ao atualizar demanda:', error);
		return res.status(500).json({ error: 'Erro ao atualizar demanda' });
	}
};

// Deletar uma demanda
const deleteDemanda = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await demandasModel.deleteDemanda(id);
		if (!deleted) {
			return res.status(404).json({ message: 'Demanda não encontrada' });
		}
		return res.status(200).json({ message: 'Demanda deletada com sucesso' });
	} catch (error) {
		console.error('Erro ao deletar demanda:', error);
		return res.status(500).json({ error: 'Erro ao deletar demanda' });
	}
};

module.exports = {
	getAllDemandas,
	getDemandaById,
	createDemanda,
	updateDemanda,
	deleteDemanda,
	// extra filtered handlers
	getDemandasByResponsavel: async (req, res) => {
		try {
			const { user_id } = req.params;
			const demandas = await demandasModel.getDemandasByResponsavel(user_id);
			return res.status(200).json(demandas);
		} catch (error) {
			console.error('Erro ao obter demandas por responsável:', error);
			return res.status(500).json({ error: 'Erro ao obter demandas por responsável' });
		}
	},
	getDemandasByUserCreated: async (req, res) => {
		try {
			const { user_id } = req.params;
			const demandas = await demandasModel.getDemandasByUserCreated(user_id);
			return res.status(200).json(demandas);
		} catch (error) {
			console.error('Erro ao obter demandas por criador:', error);
			return res.status(500).json({ error: 'Erro ao obter demandas por criador' });
		}
	},
	getDemandasByPrazo: async (req, res) => {
		try {
			const { prazo } = req.params; // esperado formato YYYY-MM-DD
			const demandas = await demandasModel.getDemandasByPrazo(prazo);
			return res.status(200).json(demandas);
		} catch (error) {
			console.error('Erro ao obter demandas por prazo:', error);
			return res.status(500).json({ error: 'Erro ao obter demandas por prazo' });
		}
	},
	getDemandasByStatus: async (req, res) => {
		try {
			const { status } = req.params;
			const demandas = await demandasModel.getDemandasByStatus(status);
			return res.status(200).json(demandas);
		} catch (error) {
			console.error('Erro ao obter demandas por status:', error);
			return res.status(500).json({ error: 'Erro ao obter demandas por status' });
		}
	},
};

