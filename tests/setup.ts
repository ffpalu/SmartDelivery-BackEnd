import { AppDataSource } from '../src/config/database';

beforeAll(async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}, 30000);

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

beforeEach(async () => {
  // Disable foreign key checks
  await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  
  const entities = AppDataSource.entityMetadatas;
  
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
  
  // Re-enable foreign key checks
  await AppDataSource.query('SET FOREIGN_KEY_CHECKS = 1');
}, 10000);