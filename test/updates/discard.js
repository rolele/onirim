import expect from 'expect'
import { discard } from '../../app/lib/updates'
import { WON, LOST } from '../../app/lib/constants'

describe( 'updates', function() {

  describe( 'discard', function() {
    beforeEach( function() {
      this.game = {
        deck: [ 'GS', 'NN', 'GM', 'GD', 'NN', 'GK', 'YS', 'YM', 'YK', 'NN', 'NN', 'NN' ],
        doors: [],
        limbo: [],
        hand: [ 'RK', 'RM', 'BK', 'BD' ],
        discarded: [],
        prophecy: []
      }
    } )

    it( 'should not discard if card not found', function() {
      expect( () => discard( this.game, 'NOPE' ) ).toThrow()
    } )

    it( 'should reset activeLimbo', function() {
      const game = { ...this.game, activeLimbo: 1 }
      const { activeLimbo } = discard( game, 'RK' )
      expect( activeLimbo ).toEqual( null )
    } )

    it( 'should remove the card from your hand', function() {
      const { hand } = discard( this.game, 'RK' )
      expect( hand.length ).toEqual( this.game.hand.length - 1 )
    } )

    it( 'should result in a loss to discard a door', function() {
      const { status } = discard( this.game, 'BD' )
      expect( status ).toEqual( LOST )
    } )

    describe( 'sorting doors', function() {
      beforeEach( function() {
        this.game.doors = [ 'RD--1', 'GD' ]
      } )
      it( 'should sort when granted from limbo via key', function() {
        const game = { ...this.game, limbo: [ 'RD--2' ], activeLimbo: 'RD--2' }
        const { doors } = discard( game, 'RK' )
        expect( doors ).toEqual( [ 'GD', 'RD--1', 'RD--2' ] )
      } )
      it( 'should sort when discarding a door against a nightmare', function() {
        const game = { ...this.game, limbo: [ 'NN' ], activeLimbo: 'NN', doors: [ 'BD', 'GD', 'RD' ] }
        const { doors } = discard( game, 'GD' )
        expect( doors ).toEqual( [ 'BD', 'RD' ] )
      } )
    } )

    describe( 'prophecy', function() {
      it( 'discarding a key should trigger a prophecy', function() {
        const { prophecy, hand, discarded, deck } = discard( this.game, 'RK' )
        expect( prophecy.length ).toEqual( 5 )
        expect( hand.length ).toEqual( this.game.hand.length - 1 )
        expect( deck.length ).toEqual( this.game.deck.length - 5 )
      } )

      it( 'should not trigger a second prophecy', function() {
        const game = { ...this.game, ...discard( this.game, 'RK' ) }
        const { prophecy, hand, discarded, deck } = discard( game, 'BK' )
        expect( prophecy ).toEqual( game.prophecy )
        expect( discarded ).toContain( 'RK' )
      } )

      it( 'should discard from prophecy', function() {
        const game = { ...this.game, prophecy: [ 'NN', 'GD' ] }
        const { prophecy, discarded } = discard( game, 'NN' )
        expect( prophecy ).toEqual( [ 'GD' ] )
        expect( discarded ).toContain( 'NN' )
      } )

      it( 'should instant loss when discarding a door from prophecy', function() {
        const game = { ...this.game, prophecy: [ 'NN', 'GD' ] }
        const { status } = discard( game, 'GD' )
        expect( status ).toEqual( LOST )
      } )
    } )

    describe( 'with a nightmare in limbo', function() {
      beforeEach( function() {
        this.game.limbo = [ 'NN' ]
        this.game.activeLimbo = 'NN'
      } )

      it( 'discarding a key should clear the nightmare', function() {
        const { discarded, limbo } = discard( this.game, 'RK' )
        expect( discarded ).toContain( 'NN' )
        expect( discarded ).toContain( 'RK' )
        expect( limbo.length ).toEqual( 0 )
      } )
      it( 'should discard a door against a nightmare', function() {
        this.game.doors = [ 'RD' ]
        const { doors, limbo, discarded } = discard( this.game, 'RD' )
        expect( doors ).toNotContain( 'RD' )
        expect( discarded ).toContain( 'RD' )
        expect( discarded ).toContain( 'NN' )
        expect( limbo ).toNotContain( 'NN' )
      } )
    } )

    describe( 'with a door in limbo', function() {
      beforeEach( function() {
        this.game.limbo = [ 'RD' ]
      } )

      it( 'should grant the door for a matching key', function() {
        const { discarded, limbo, doors, hand } = discard( this.game, 'RK' )
        expect( discarded ).toContain( 'RK' )
        expect( doors ).toContain( 'RD' )
        expect( hand ).toNotContain( 'RK' )
        expect( limbo.length ).toEqual( 0 )
      } )

      it( 'should win when granting the last door', function() {
        let game = { ...this.game, doors: [ 1, 2, 3, 4, 5, 6, 7 ] }
        const { status } = discard( game, 'RK' )
        expect( status ).toEqual( WON )
      } )
    } )
  } )

} )
