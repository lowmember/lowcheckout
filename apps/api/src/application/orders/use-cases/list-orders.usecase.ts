import type { OrderDto } from "@/application/orders/dtos/order.dto";
import { toOrderDto } from "@/application/orders/mappers/order.mapper";
import type { PageDto } from "@/application/shared/dtos/page.dto";
import type { UseCase } from "@/application/shared/use-case";
import type { OrdersRepository } from "@/domain/orders/repositories/orders.repository";
import type { OrderStatus } from "@/domain/orders/value-objects/order-status";

export interface ListOrdersInput {
  accountId: string;
  page: number;
  perPage: number;
  status?: OrderStatus;
  search?: string;
}

export type ListOrdersUseCase = UseCase<ListOrdersInput, PageDto<OrderDto>>;

/** Tela de vendas do painel: os pedidos da conta, do mais recente para o mais antigo. */
export class DefaultListOrdersUseCase implements ListOrdersUseCase {
  private readonly ordersRepository: OrdersRepository;

  constructor(ordersRepository: OrdersRepository) {
    this.ordersRepository = ordersRepository;
  }

  async execute(input: ListOrdersInput): Promise<PageDto<OrderDto>> {
    const { items, total } = await this.ordersRepository.findManyByAccount(input);

    return {
      data: items.map(toOrderDto),
      meta: { page: input.page, perPage: input.perPage, total },
    };
  }
}
