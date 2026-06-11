// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register, login } from '../controllers/authController.js';
import { User, Tenant } from '../models/index.js';
import bcrypt from 'bcryptjs';

// Mockar os modelos do banco de dados
vi.mock('../models/index.js', () => {
  return {
    User: {
      findOne: vi.fn(),
      create: vi.fn()
    },
    Tenant: {
      create: vi.fn()
    }
  };
});

describe('Auth Controller - Testes de Integração de API', () => {
  let mockRes;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Simulação dos objetos req e res do Express
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
  });

  describe('Registro de Usuário (register)', () => {
    it('deve registrar um novo usuário com sucesso e criar uma organização', async () => {
      const mockReq = {
        body: {
          name: 'João Silva',
          email: 'joao@teste.com',
          password: 'senha_segura',
          tenantName: 'Empresa João'
        }
      };

      // Simular que o usuário não existe no banco
      User.findOne.mockResolvedValue(null);

      // Simular criação da Organização (Tenant)
      Tenant.create.mockResolvedValue({
        _id: 'tenant-id-123',
        name: 'Empresa João'
      });

      // Simular criação do usuário
      User.create.mockResolvedValue({
        _id: 'user-id-999',
        name: 'João Silva',
        email: 'joao@teste.com',
        role: 'admin',
        tenant_id: 'tenant-id-123'
      });

      await register(mockReq, mockRes);

      // Asserções
      expect(User.findOne).toHaveBeenCalledWith({ email: 'joao@teste.com' });
      expect(Tenant.create).toHaveBeenCalledWith({ name: 'Empresa João' });
      expect(User.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user-id-999',
          name: 'João Silva',
          email: 'joao@teste.com',
          token: expect.any(String)
        })
      );
    });

    it('deve retornar erro 400 se o usuário já existir', async () => {
      const mockReq = {
        body: {
          name: 'João Silva',
          email: 'joao_existente@teste.com',
          password: 'senha_segura'
        }
      };

      // Simular que o usuário já existe
      User.findOne.mockResolvedValue({ _id: 'user-existente' });

      await register(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });
  });

  describe('Autenticação de Usuário (login)', () => {
    it('deve autenticar o usuário com sucesso quando a senha estiver correta', async () => {
      const mockReq = {
        body: {
          email: 'login@teste.com',
          password: 'senha_correta'
        }
      };

      const mockSave = vi.fn().mockResolvedValue(true);

      // Simular encontrar usuário no banco
      User.findOne.mockResolvedValue({
        _id: 'user-id-111',
        name: 'Usuário Login',
        email: 'login@teste.com',
        password_hash: 'senha_criptografada_hash',
        role: 'admin',
        tenant_id: 'tenant-id-123',
        save: mockSave
      });

      // Mockar o bcrypt compare para retornar true
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await login(mockReq, mockRes);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'login@teste.com' });
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'user-id-111',
          name: 'Usuário Login',
          token: expect.any(String)
        })
      );
    });

    it('deve retornar erro 401 para credenciais incorretas', async () => {
      const mockReq = {
        body: {
          email: 'login_errado@teste.com',
          password: 'senha_errada'
        }
      };

      // Simular encontrar usuário no banco
      User.findOne.mockResolvedValue({
        _id: 'user-id-111',
        password_hash: 'senha_criptografada_hash'
      });

      // Mockar bcrypt compare para retornar false
      vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await login(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
    });
  });
});
