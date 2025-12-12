import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private connection: Connection) {}

  async check() {
    const dbStatus = await this.checkDatabase();

    return {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      version: '1.0.0',
      service: 'country-delight-backend',
    };
  }

  async readinessCheck() {
    const dbStatus = await this.checkDatabase();

    if (dbStatus !== 'connected') {
      throw new ServiceUnavailableException({
        status: 'not ready',
        reason: 'Database not connected',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
      },
    };
  }

  async livenessCheck() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      if (this.connection.readyState === 1) {
        return 'connected';
      } else if (this.connection.readyState === 2) {
        return 'connecting';
      } else if (this.connection.readyState === 0) {
        return 'disconnected';
      } else {
        return 'disconnecting';
      }
    } catch (error) {
      return 'error';
    }
  }
}
