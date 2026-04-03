using Foodie.Api.Entities;

namespace Foodie.Api.Auth;

public interface ITokenService
{
    TokenPair CreateTokenPair(FoodieUser user, Guid sessionId);
}