import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { QueryLoanDto } from './dto/query-loan.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface AuthUser {
  userId: number;
  role: Role;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Roles(Role.DOSEN)
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLoanDto) {
    return this.loansService.create(user.userId, dto);
  }

  @Get()
  findAll(@Query() query: QueryLoanDto, @CurrentUser() user: AuthUser) {
    return this.loansService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.loansService.findOne(id, user);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLoanStatusDto,
  ) {
    return this.loansService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.loansService.cancel(id, user);
  }
}